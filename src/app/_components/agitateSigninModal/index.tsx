"use client";
import Modal from "react-modal";
import { GithubButton } from "./githubButton";
import { DiscordButton } from "./discordButton";

const styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "1rem", // tailwind class 'round-xl' equivalent
    backgroundColor: "#e5e5e5", // nice gray background
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)", // background blur effect
    backdropFilter: "blur(10px)",
  },
};

export const AgitateSigninModal = () => {
  return (
    <Modal isOpen={true} style={styles} contentLabel={"Agitate to signin"}>
      <div className="flex w-[30rem] flex-col items-center gap-5 px-1 py-2">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-center text-4xl">
            Hello friend, please log in before using chat
          </h1>
          <label>* its needed for saving your chats and message history</label>
        </div>
        <div className="flex flex-col gap-2">
          <GithubButton />
          <DiscordButton />
        </div>
      </div>
    </Modal>
  );
};
