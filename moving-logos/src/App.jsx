import "./App.css";

const logos = [
  "/logo1.png",
  "/logo2.png",
  "/logo3.png",
  "/logo4.png",
  "/logo5.png",
];

export default function LogoSlider() {
  const repeatedLogos = [...logos, ...logos];

  return (
    <div className="slider" aria-label="Brand logo carousel">
      <div className="slide-track">
        {repeatedLogos.map((logo, index) => (
          <div className="slide" key={`${logo}-${index}`}>
            <img src={logo} alt="" />
          </div>
        ))}
      </div>
    </div>
  );
}