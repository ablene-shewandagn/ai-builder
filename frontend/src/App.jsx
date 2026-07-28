import {useState} from "react";
import "./App.css";


function App(){

const [prompt,setPrompt]=useState("");

const [message,setMessage]=useState("");

const [previewUrl,setPreviewUrl]=useState("");

const [loading,setLoading]=useState(false);



async function generate(){


setLoading(true);

setMessage("");

setPreviewUrl("");



try{


const res = await fetch(

"https://ai-builder-y6jo.onrender.com/api/generate-project",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

prompt

})

}

);



const data = await res.json();



console.log(data);



setMessage(

data.message || data.error

);



if(data.previewUrl){

setPreviewUrl(data.previewUrl);

}



}catch(err){


setMessage(
"❌ "+err.message
);


}


setLoading(false);


}



return(

<div className="app">


<h1>
🧠 Ablene AI Builder
</h1>


<textarea

placeholder="Describe your website..."

value={prompt}

onChange={(e)=>setPrompt(e.target.value)}

/>



<br/>


<button onClick={generate}>

{

loading ?

"Generating..."

:

"Generate Website"

}

</button>



<h3>
{message}
</h3>



{

previewUrl &&

<iframe

src={previewUrl}

title="Generated Website"

width="100%"

height="700"

/>

}



</div>

);


}


export default App;