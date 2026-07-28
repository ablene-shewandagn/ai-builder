require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");


const app = express();


app.use(cors());

app.use(
  express.json({
    limit: "20mb"
  })
);


// =============================
// CONFIG
// =============================

const PORT = process.env.PORT || 5000;


const groq = new Groq({

  apiKey: process.env.GROQ_API_KEY

});


const AI_MODEL = "llama-3.3-70b-versatile";



// =============================
// GENERATED PROJECTS
// =============================

const generatedProjectsPath = path.join(
  __dirname,
  "generated-projects"
);


if(!fs.existsSync(generatedProjectsPath)){

  fs.mkdirSync(
    generatedProjectsPath,
    {
      recursive:true
    }
  );

}



app.use(
  "/generated-projects",
  express.static(
    generatedProjectsPath
  )
);



// =============================
// TEST
// =============================

app.get("/",(req,res)=>{

  res.json({

    message:
    "AI Builder Backend is running!"

  });

});



// =============================
// AI FUNCTION
// =============================

async function askAI(prompt){


const response = await groq.chat.completions.create({

model: AI_MODEL,


messages:[

{

role:"user",

content:prompt

}

]

});


return response.choices[0].message.content;


}



// =============================
// GENERATE WEBSITE
// =============================

app.post(
"/api/generate-project",
async(req,res)=>{


try{


const {prompt}=req.body;



if(!prompt){

return res.status(400).json({

error:
"Prompt required"

});

}



const aiPrompt = `

Create a complete website.

User request:

${prompt}


Return only:

---HTML---
html code

---CSS---
css code

---JS---
javascript code


No explanation.
No markdown.

`;



const aiText = await askAI(aiPrompt);



const clean = aiText

.replace(/```html/gi,"")

.replace(/```css/gi,"")

.replace(/```javascript/gi,"")

.replace(/```js/gi,"")

.replace(/```/g,"")

.trim();





const htmlMatch =
clean.match(
/---HTML---([\s\S]*?)---CSS---/i
);



const cssMatch =
clean.match(
/---CSS---([\s\S]*?)---JS---/i
);



const jsMatch =
clean.match(
/---JS---([\s\S]*)/i
);





if(
!htmlMatch ||
!cssMatch ||
!jsMatch
){

return res.status(500).json({

error:
"Invalid AI format"

});

}





const projectPath = path.join(

generatedProjectsPath,

"my-project"

);



fs.mkdirSync(

projectPath,

{

recursive:true

}

);





fs.writeFileSync(

path.join(

projectPath,

"index.html"

),

htmlMatch[1].trim()

);



fs.writeFileSync(

path.join(

projectPath,

"style.css"

),

cssMatch[1].trim()

);



fs.writeFileSync(

path.join(

projectPath,

"script.js"

),

jsMatch[1].trim()

);





const previewUrl =

`${req.protocol}://${req.get("host")}/generated-projects/my-project/index.html`;





res.json({

message:

"Project generated successfully",

previewUrl

});





}catch(error){


console.error(error);


res.status(500).json({

error:error.message

});


}


});





app.listen(

PORT,

()=>{


console.log(

`Server running on port ${PORT}`

);


}

);