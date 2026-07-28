import "./app.css";

const logos = [
  "/logo1.png",
  "/logo2.png",
  "/logo3.png",
  "/logo4.png",
  "/logo5.png",
];

export default function LogoSlider() {
  return (
    <div className="slider">
      <div className="slide-track">
        {[...logos, ...logos].map((logo, index) => (
          <div className="slide" key={index}>
            <img src={logo} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}