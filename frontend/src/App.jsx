import { useState } from "react";
import "./App.css";


function App() {


  const [prompt, setPrompt] = useState("");

  const [result, setResult] = useState("");

  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);



  const generateWebsite = async () => {


    if (!prompt) {

      alert("Please enter website idea");

      return;

    }



    try {


      setLoading(true);

      setResult("");

      setPreviewUrl("");



      const response = await fetch(

        "https://ai-builder-y6jo.onrender.com/api/generate-project",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json"

          },

          body: JSON.stringify({

            prompt

          })

        }

      );



      const data = await response.json();



      if (!response.ok) {


        throw new Error(

          data.error || "Generation failed"

        );


      }



      setResult(

        data.message

      );



      if(data.previewUrl){

        setPreviewUrl(

          data.previewUrl

        );

      }



    } catch(error) {


      setResult(

        "❌ " + error.message

      );


    } finally {


      setLoading(false);


    }


  };





  return (

    <div className="app">


      <h1>
        🧠 Ablene's AI Builder
      </h1>



      <p>
        Generate complete websites using AI
      </p>



      <textarea

        value={prompt}

        onChange={(e)=>
          setPrompt(e.target.value)
        }

        placeholder="Describe the website you want..."

      />



      <button

        onClick={generateWebsite}

        disabled={loading}

      >

        {loading

          ? "Generating..."

          : "Generate Website"

        }


      </button>




      <div className="response">


        {result && (

          <h3>

            {result}

          </h3>

        )}



      </div>





      {previewUrl && (


        <div className="preview">


          <h2>

            🌐 Generated Website Preview

          </h2>



          <iframe

            src={previewUrl}

            width="100%"

            height="700px"

            title="Generated Website"

            style={{

              border:"1px solid #ccc",

              borderRadius:"12px"

            }}

          />


        </div>


      )}



    </div>

  );


}


export default App;