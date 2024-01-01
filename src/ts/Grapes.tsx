export const Grapes = () => {
  let colors = ["#9D2690", "#ee1111", "#ffea00"];

  return (
    <div className="absolute h-screen w-screen top-[-10%]">
      <div className="w-full h-screen relative">
        {colors.map((c, i) => {
          return (
            <img 
            key={c}
            src="https://media1.giphy.com/media/8JTfg0ZQmsqvCi75cT/giphy.gif?cid=6c09b952nd8gc733nv9ceesqngqabcg3u3d3biciznd70bdg&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s"
            className={`w-full absolute md:w-1/2`}
            style={{ animation: "fall 6.1s" }}
            ></img>
            
          );
        })}
      </div>
    </div>
  );
};
