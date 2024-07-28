import { Router } from "express";
import { prisma } from "../prisma.js";
import { createResponse } from "../utils/response.js";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const router = Router();

router.post("/post/create", async (req, res) => {
  try {
    const title = req.body.title;
    const content = req.body.content;
    const src = req.body.src;
    const category_id = req.body.category_id;
    const urlImage = req.body.urlImage;

    if (!title || !src || !category_id) {
      res.status(400).json(createResponse("All fields are necessary", "error"));
      return;
    }

    const post = await prisma.post.create({
      data: {
        title: title,
        content: content || "",
        src: src,
        urlImage: urlImage || "",
        category_id: parseInt(category_id),
      },
    });

    res.status(200).json(post);
  } catch (error) {
    res.json(createResponse(error.name || error, "error"));
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        isPublic: true
      },
      include: {
        category: true
      }
    });
    res.json(posts);
  } catch (error) {
    res.json(createResponse("Error in server", "error"));
  }
});

router.get("/category/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const posts = await prisma.post.findMany({
      where: {
        category_id: id
      },
      include: {
        category: true,
      },
    });
    res.status(200).json(posts);
  } catch (e) {
    res.status(500).json(createResponse("Error in server", "error"));
  }
});

router.post("/ai/posts", async (req, res)=> {
  const userMessage = req.body.message

  if(!userMessage){
     res.status(400).json(createResponse("All fields are necessary", "error"));
    return;
  }

  const posts = await prisma.post.findMany({
    where:{
      isPublic: true
    },
    include:{
      category: true
    }
  })

  const prompt = `
    TE VOY A PASAR VARIOS RECURSOS PARA PROGRAMADORES, PERO OCUPO QUE CUMPLAS TODAS 
    LAS SIGUIENTES REGLAS PARA ESCOGER LOS QUE MEJOR SE ACOMODEN CON EL MENSAJE DEL USUARIO.
    
    ESTE ES EL MENSAJE: "${userMessage}"
    
    PRIMERO, VERIFICA QUE EL MENSAJE CUMPLA LAS SIGUIENTES REGLAS: 

    1. SI EL MENSAJE NO TIENE QUE VER CON UN TEMA RELACIONADO CON EL MUNDO DE LA PROGRAMACIÓN O ES DE UN TEMA NO ADECUADO, DIME: NO EXISTE
    2. SI EL MENSAJE ES MUY CORTO O SIN SENTIDO, DIME: NO EXISTE
    3. SI EL MENSAJE CONTIENE PALABRAS SENSIBLES O RELACIONADAS CON LA SEXUALIDAD O SIMPLEMENTE INAPROPIADAS PARA TODO EL PÚBLICO, DIME: NO EXISTE
    
    ***ASEGURARTE QUE EL MENSAJE CUMPLA CON LAS REGLAS ANTERIORES.***
    
    DE TODOS ESTOS RECURSOS, QUIERO QUE ESCOJAS LOS QUE MEJOR SE ACOMODEN CON EL MENSAJE DEL USUARIO, SIGIENDO ESTAS REGALS  
    
    1. SOLO UTILIZA LAS DESCRIPCIONES PARA SELECCIONARLOS SI NO TIENE EXCLÚYELOS.
    2. SELECCIONA A LOS QUE TENGAN UNA GRAN RELACIÓN CON EL MENSAJE, SI NO TIENEN RELACIÓN EXCLÚYELOS.
    3. VERIFICA SI LA CATEGORÍA TIENE QUE VER CON UNA RED SOCIAL, PORQUE SI ES ASÍ, EXCLÚYELOS A MENOS QUE EL 
    MENSAJE PIDA ALGO RELACIONADO CON REDES SOCIALES O CREADORES DE CONTENIDO.

    AQUÍ ESTAN LOS RECURSOS RECUERDA ESCOGER CON LAS REGLAS ANTERIORES 

    ${
      posts.map((post) => (
        `ID: ${post.id}
        Descripción: ${post.content}
        Categoría: ${post.category.name}
        \n`
      )).join('')
    }

    DE TODOS LOS RECURSOS QUE ENCONTRASTE, DIME LOS ID DE CADA RECURSO DE ESTA FORMA [1, 2, 3, ...]. SOLO DIME ESO. 
    EN EL CASO DE QUE NO HAYA UNO RELACIONADO, SOLO DIME: NO EXISTE
  `
  
  const perplexity = createOpenAI({
    apiKey: process.env.PERPLEXITY_APIKEY,
    baseURL: "https://api.perplexity.ai",
  })
  
  const { text } = await generateText({
    model: perplexity("llama-3-sonar-large-32k-chat"),
    prompt: prompt
  })


  if(text != "NO EXISTE" && text.includes("[") && text.includes("]")){
    try{
      const response = JSON.parse(text)
      const posts = await prisma.post.findMany({
        where:{
          isPublic: true,
          id:{
            in: response
          }
        },
        include:{
          category: true
        }
       })
      res.status(200).json(posts)
    }catch(e){
      res.sendStatus(204)
    } 
  }
  else{
    res.sendStatus(204)
  }
})

export default router;
