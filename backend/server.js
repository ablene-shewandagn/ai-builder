require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "20mb"
  })
);


// ================================
// CONFIG
// ================================

const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


const GEMINI_MODEL = "gemini-3.5-flash";


// ================================
// GENERATED PROJECTS
// ================================

const generatedProjectsPath =
  path.join(
    __dirname,
    "..",
    "generated-projects"
  );


app.use(
  "/generated-projects",
  express.static(generatedProjectsPath)
);


// ================================
// TEST
// ================================

app.get("/", (req, res) => {

  res.json({
    message:
      "AI Builder Backend is running!"
  });

});


// ================================
// GEMINI FUNCTION
// ================================

async function askGemini(prompt) {

  try {

    const response =
      await ai.models.generateContent({

        model: GEMINI_MODEL,

        contents: prompt

      });


    return response.text;


  } catch(error) {

    console.error(
      "GEMINI ERROR:",
      error
    );


    throw new Error(
      error.message ||
      "Gemini failed"
    );

  }

}



// ================================
// SIMPLE AI ROUTE
// ================================

app.post(
  "/api/ai",
  async(req,res)=>{

    try {

      const {
        prompt
      } = req.body;


      if(!prompt){

        return res.status(400).json({
          error:
            "Prompt required"
        });

      }


      const result =
        await askGemini(prompt);


      res.json({

        result

      });


    }catch(error){

      res.status(500).json({

        error:
          error.message

      });

    }

  }
);



// ================================
// GENERATE WEBSITE
// ================================

app.post(
"/api/generate-project",
async(req,res)=>{


try{


const {
  prompt
}=req.body;



if(!prompt){

return res.status(400).json({

error:
"Website prompt required"

});

}



const projectPrompt = `

You are a professional web developer.

Create a complete website.

User request:

${prompt}


Return ONLY this format:


---HTML---

complete html


---CSS---

complete css


---JS---

complete javascript


Rules:

No markdown.
No explanation.
HTML must link style.css.
HTML must link script.js.

`;



const aiText =
await askGemini(projectPrompt);



// remove markdown

const clean =
aiText
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



const html =
htmlMatch[1].trim();


const css =
cssMatch[1].trim();


const js =
jsMatch[1].trim();



// create folder

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



// save files

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
error
);


res.status(500).json({

error:
error.message

});


}


});




// ================================
// START
// ================================


app.listen(
PORT,
()=>{

console.log(
`Server running on port ${PORT}`
);

});