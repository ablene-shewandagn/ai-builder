require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

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


const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY

});


const OPENAI_MODEL = "gpt-4.1-mini";



// =============================
// GENERATED PROJECTS
// =============================

const generatedProjectsPath = path.join(
  __dirname,
  "..",
  "generated-projects"
);


app.use(
  "/generated-projects",
  express.static(generatedProjectsPath)
);



// =============================
// TEST ROUTE
// =============================

app.get("/", (req, res)=>{

  res.json({

    message:
    "AI Builder Backend is running!"

  });

});



// =============================
// OPENAI FUNCTION
// =============================

async function askAI(prompt){

  try{

    const response =
      await client.responses.create({

        model: OPENAI_MODEL,

        input: prompt

      });


    return response.output_text;


  }catch(error){

    console.error(
      "OPENAI ERROR:",
      error.message
    );


    throw error;

  }

}



// =============================
// AI CHAT
// =============================

app.post(
"/api/ai",
async(req,res)=>{

  try{

    const { prompt } = req.body;


    if(!prompt){

      return res.status(400).json({

        error:
        "Prompt is required"

      });

    }


    const result =
      await askAI(prompt);


    res.json({

      result

    });


  }catch(error){


    res.status(500).json({

      error:
      error.message

    });


  }

});




// =============================
// GENERATE PROJECT
// =============================

app.post(
"/api/generate-project",
async(req,res)=>{


try{


const { prompt } = req.body;


if(!prompt){

return res.status(400).json({

error:
"Website prompt is required"

});

}



const projectPrompt = `

You are a professional web developer.

Create a complete modern website.

User request:

${prompt}


Return ONLY:

---HTML---

HTML CODE


---CSS---

CSS CODE


---JS---

JAVASCRIPT CODE


Rules:

- No explanation.
- No markdown.
- HTML must connect style.css.
- HTML must connect script.js.
- CSS must be responsive.
- JavaScript must work.

`;



const aiText =
await askAI(projectPrompt);



const cleanText =
aiText
.replace(/```html/gi,"")
.replace(/```css/gi,"")
.replace(/```javascript/gi,"")
.replace(/```js/gi,"")
.replace(/```/g,"")
.trim();



const htmlMatch =
cleanText.match(
/---HTML---([\s\S]*?)---CSS---/i
);


const cssMatch =
cleanText.match(
/---CSS---([\s\S]*?)---JS---/i
);


const jsMatch =
cleanText.match(
/---JS---([\s\S]*)/i
);



if(
!htmlMatch ||
!cssMatch ||
!jsMatch
){

return res.status(500).json({

error:
"AI returned invalid format"

});

}



const html =
htmlMatch[1].trim();


const css =
cssMatch[1].trim();


const js =
jsMatch[1].trim();




const projectPath =
path.join(
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
path.join(projectPath,"index.html"),
html
);


fs.writeFileSync(
path.join(projectPath,"style.css"),
css
);


fs.writeFileSync(
path.join(projectPath,"script.js"),
js
);



res.json({

message:
"Project generated successfully",


previewUrl:
`${req.protocol}://${req.get("host")}/generated-projects/my-project/index.html`

});



}catch(error){


console.error(
"PROJECT ERROR:",
error.message
);



res.status(500).json({

error:
error.message

});


}


});




// =============================
// START SERVER
// =============================

app.listen(
PORT,
()=>{

console.log(
`Server running on port ${PORT}`
);

});