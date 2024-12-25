import "./loadingIcon.css";
import Image from "next/image";
import loadingFlask from "../../../public/images/loading_flask.png";
import bubble from "../../../public/images/bubble1.png";

type LoadingIconProps = {
  message: string;
};

const LoadingIcon = ({ message }: LoadingIconProps) => {
  return (
    <div className="load-container">
      <Image src={loadingFlask} alt="loading" className="flask" />
      <Image src={bubble} alt="bubble" className="bubble1" />
      <Image src={bubble} alt="bubble" className="bubble2" />
      {Array.from(Array(25).keys()).map((key) => {
        return (
          <Image
            key={key}
            src={bubble}
            alt="bubble"
            className={`bubble${key % 2 === 0 ? 1 : 2}`}
            style={{
              translate: `${(Math.random() - 0.65) * 15}rem ${
                (Math.random() - 0.85) * 5
              }rem`,
              zIndex: 25 - key,
              animationDelay: key / 10 + "s",
              animationDuration: Math.max(key / 5, 3) + "s",
            }}
          />
        );
      })}
    </div>
  );
};

export default LoadingIcon;
