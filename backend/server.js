require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());

app.use(express.json({
  limit: "20mb"
}));


// =====================================
// CONFIGURATION
// =====================================

const PORT = 5000;

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

// Current Gemini model
const GEMINI_MODEL = "gemini-3.5-flash";


// =====================================
// GENERATED PROJECTS FOLDER
// =====================================

const generatedProjectsPath =
  path.join(
    __dirname,
    "..",
    "generated-projects"
  );


// Serve generated projects
app.use(
  "/generated-projects",
  express.static(
    generatedProjectsPath
  )
);


// =====================================
// TEST ROUTE
// =====================================

app.get("/", (req, res) => {

  res.json({

    message:
      "AI Builder Backend is running!"

  });

});


// =====================================
// GEMINI FUNCTION
// =====================================

async function askGemini(prompt) {

  const response = await fetch(

    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,

    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json"

      },

      body: JSON.stringify({

        contents: [

          {

            parts: [

              {

                text: prompt

              }

            ]

          }

        ]

      })

    }

  );


  const data =
    await response.json();


  if (!response.ok) {

    console.error(
      "GEMINI ERROR:",
      data
    );


    throw new Error(

      data?.error?.message ||

      "Gemini API request failed"

    );

  }


  const result =

    data?.candidates?.[0]

      ?.content

      ?.parts?.[0]

      ?.text;


  if (!result) {

    throw new Error(

      "Gemini returned empty response"

    );

  }


  return result;

}


// =====================================
// AI RESPONSE ROUTE
// =====================================

app.post(

  "/api/ai",

  async (req, res) => {

    try {

      const {

        prompt

      } = req.body;


      if (!prompt) {

        return res.status(400).json({

          error:
            "Prompt is required"

        });

      }


      const result =

        await askGemini(

          prompt

        );


      res.json({

        result

      });

    }

    catch (error) {

      console.error(

        "AI ERROR:",
        error

      );


      res.status(500).json({

        error:

          error.message

      });

    }

  }

);


// =====================================
// GENERATE PROJECT ROUTE
// =====================================

app.post(

  "/api/generate-project",

  async (req, res) => {

    try {

      const {

        prompt

      } = req.body;


      if (!prompt) {

        return res.status(400).json({

          error:

            "Website prompt is required"

        });

      }


      console.log(

        "Generating project..."

      );


      // ===============================
      // AI PROMPT
      // ===============================

      const projectPrompt = `

You are a professional web developer.

Build a complete modern website.

USER REQUEST:

${prompt}


Return ONLY the following format:

---HTML---

[Complete HTML code here]

---CSS---

[Complete CSS code here]

---JS---

[Complete JavaScript code here]


IMPORTANT RULES:

- Do NOT explain anything.
- Do NOT use Markdown code fences.
- Return all three sections.
- HTML must be complete.
- HTML must link to style.css.
- HTML must link to script.js.
- CSS must be responsive.
- JavaScript must be functional.

`;

      const aiText =

        await askGemini(

          projectPrompt

        );


      console.log(

        "AI RESPONSE RECEIVED"

      );


      // ===============================
      // CLEAN RESPONSE
      // ===============================

      const cleanText =

        aiText

          .replace(

            /```html/gi,

            ""

          )

          .replace(

            /```css/gi,

            ""

          )

          .replace(

            /```javascript/gi,

            ""

          )

          .replace(

            /```js/gi,

            ""

          )

          .replace(

            /```/g,

            ""

          )

          .trim();


      // ===============================
      // EXTRACT HTML
      // ===============================

      const htmlMatch =

        cleanText.match(

          /---HTML---([\s\S]*?)---CSS---/i

        );


      // ===============================
      // EXTRACT CSS
      // ===============================

      const cssMatch =

        cleanText.match(

          /---CSS---([\s\S]*?)---JS---/i

        );


      // ===============================
      // EXTRACT JS
      // ===============================

      const jsMatch =

        cleanText.match(

          /---JS---([\s\S]*)/i

        );


      if (

        !htmlMatch ||

        !cssMatch ||

        !jsMatch

      ) {

        console.error(

          "INVALID AI PROJECT FORMAT"

        );


        console.log(

          aiText

        );


        return res.status(500).json({

          error:

            "AI returned invalid project format"

        });

      }


      const html =

        htmlMatch[1].trim();


      const css =

        cssMatch[1].trim();


      const js =

        jsMatch[1].trim();


      // ===============================
      // CREATE PROJECT FOLDER
      // ===============================

      const projectPath =

        path.join(

          generatedProjectsPath,

          "my-project"

        );


      fs.mkdirSync(

        projectPath,

        {

          recursive: true

        }

      );


      // ===============================
      // SAVE HTML
      // ===============================

      fs.writeFileSync(

        path.join(

          projectPath,

          "index.html"

        ),

        html,

        "utf8"

      );


      // ===============================
      // SAVE CSS
      // ===============================

      fs.writeFileSync(

        path.join(

          projectPath,

          "style.css"

        ),

        css,

        "utf8"

      );


      // ===============================
      // SAVE JAVASCRIPT
      // ===============================

      fs.writeFileSync(

        path.join(

          projectPath,

          "script.js"

        ),

        js,

        "utf8"

      );


      console.log(

        "PROJECT CREATED SUCCESSFULLY"

      );


      res.json({

        message:

          "Project generated successfully",

        previewUrl:

          "http://localhost:5000/generated-projects/my-project/index.html"

      });

    }

    catch (error) {

      console.error(

        "PROJECT ERROR:",

        error

      );


      res.status(500).json({

        error:

          error.message ||

          "Project generation failed"

      });

    }

  }

);


// =====================================
// START SERVER
// =====================================

app.listen(

  PORT,

  () => {

    console.log(

      `Server running on http://localhost:${PORT}`

    );

  }

);