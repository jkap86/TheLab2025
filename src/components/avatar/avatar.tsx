import user_avatar from "../../../public/images/user_avatar.jpeg";
import league_avatar from "../../../public/images/league_avatar.png";
import player_avatar from "../../../public/images/player_avatar.png";
import "./avatar.css";

type AvatarProps = {
  id: string | null | undefined;
  type: "U" | "L" | "P";
  text: string;
};

const Avatar = ({ id, type, text }: AvatarProps) => {
  let alt, src, onerror;

  if (type === "U") {
    alt = "User Avatar";
    src = `https://sleepercdn.com/avatars/${id}`;
    onerror = (e: any) => (e.currentTarget.src = user_avatar.src);
  } else if (type === "L") {
    alt = "League Avatar";
    src = `https://sleepercdn.com/avatars/${id}`;
    onerror = (e: any) => (e.currentTarget.src = league_avatar.src);
  } else if (type === "P") {
    alt = "Player Headshot";
    src = `https://sleepercdn.com/content/nfl/players/thumb/${id}.jpg`;
    onerror = (e: any) => (e.currentTarget.src = player_avatar.src);
  }

  return (
    <div className="avatar">
      <img alt={alt} src={src} className="avatar" onError={onerror} />
      <span>{text}</span>
    </div>
  );
};

export default Avatar;
