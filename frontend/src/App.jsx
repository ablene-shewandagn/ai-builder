import { useState } from "react";

import "./App.css";


function App() {


  const [prompt, setPrompt] =
    useState("");


  const [result, setResult] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  const [projectLoading, setProjectLoading] =
    useState(false);


  // ===============================
  // GENERATE WEBSITE / AI RESPONSE
  // ===============================

  async function generateWebsite() {


    if (!prompt.trim()) {

      alert(
        "Please describe your website first"
      );

      return;

    }


    setLoading(true);

    setResult("");


    try {


      const response = await fetch(

        "https://ai-builder-y6jo.onrender.com/api/ai",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            prompt: prompt

          })

        }

      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(

          data.error ||
          "AI request failed"

        );

      }


      setResult(

        data.result ||
        "No response received"

      );


    } catch (error) {


      setResult(

        "❌ " +
        error.message

      );


    } finally {


      setLoading(false);


    }

  }


  // ===============================
  // GENERATE AI PROJECT
  // ===============================

  async function generateProject() {


    if (!prompt.trim()) {

      alert(

        "Please describe your website first"

      );

      return;

    }


    setProjectLoading(true);


    try {


      const response = await fetch(
  "https://ai-builder-y6jo.onrender.com/api/generate-project",

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            prompt: prompt

          })

        }

      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(

          data.error ||

          "Project generation failed"

        );

      }


      alert(

        "✅ " +
        data.message

      );


      if (data.previewUrl) {

        window.open(

          data.previewUrl,

          "_blank"

        );

      }


    } catch (error) {


      console.error(

        "PROJECT ERROR:",

        error

      );


      alert(

        "❌ " +
        error.message

      );


    } finally {


      setProjectLoading(false);


    }

  }


  // ===============================
  // USER INTERFACE
  // ===============================

  return (

    <div className="app">


      <div className="brand">
  <img
    src="1000033871.png"
    alt="Ablene"
    className="profile-photo"
  />

  <h1>Ablene AI Builder</h1>
</div>


      <p>

        Describe the website or app

        you want to build

      </p>


      <textarea

        placeholder=

          "Example: Build a modern school management website..."

        value={prompt}

        onChange={

          (event) =>

            setPrompt(

              event.target.value

            )

        }

      />


      <div className="buttons">


        <button

          onClick={

            generateWebsite

          }

          disabled={loading}

        >

          {loading

            ? "🧠 Ablene's AI Thinking..."

            : "🧠 Generate Website"

          }

        </button>


        <button

          onClick={

            generateProject

          }

          disabled={projectLoading}

        >

          {projectLoading

            ? "🤖 Ablene's AI Building..."

            : "📁 Generate Project"

          }

        </button>


      </div>


      <div className="result">


        <h2>

          🧠 Ablene's AI Brain Response

        </h2>


        <pre>

          {result}

        </pre>


      </div>


    </div>

  );

}


export default App;