"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import { TwitterShareButton, TwitterIcon } from "react-share";

// ------------------------- Data: 20 Scenarios -------------------------
type Option = { key: string; label: string };
type Scenario = { id: string; title: string; alert: string; options: Option[]; correctKey: string; explanation: string };

const SCENARIOS: Scenario[] = [
  { id: "1", title: "Liquidity Drain Attempt", alert: "A wallet initiated a withdrawal of 95% of stablecoin liquidity from Protocol X in one tx.", options: [{key:"A", label:"Pause Function"},{key:"B", label:"Transaction Delay"},{key:"C", label:"Mint More Tokens"}], correctKey: "A", explanation: "Emergency pause prevents catastrophic liquidity drain before assets vanish." },
  { id: "2", title: "Suspicious Governance Vote", alert: "A new proposal transfers treasury funds to an unknown wallet and is set to pass in 1 hour.", options: [{key:"A", label:"Wallet Freeze"},{key:"B", label:"Voting Delay"},{key:"C", label:"Increase Gas Fees"}], correctKey: "B", explanation: "Delaying the vote gives time for Operators and community to review and stop a malicious governance takeover." },
  { id: "3", title: "Flash Loan Exploit Detected", alert: "Abnormal price movement from flash loans is manipulating Protocol Y’s collateral system.", options: [{key:"A", label:"Oracle Freeze"},{key:"B", label:"Wallet Freeze"},{key:"C", label:"Block New Deposits"}], correctKey: "A", explanation: "Pausing oracle updates prevents exploiters from draining collateral with manipulated prices." },
  { id: "4", title: "Unauthorized Contract Upgrade", alert: "An unverified contract upgrade enabling unrestricted withdrawals was pushed to Protocol Z.", options: [{key:"A", label:"Contract Rollback"},{key:"B", label:"Pause Function"},{key:"C", label:"Reward All Users With NFTs"}], correctKey: "A", explanation: "Rolling back prevents malicious upgrades from taking effect." },
  { id: "5", title: "Suspicious Whale Movement", alert: "A newly created wallet received $10M and is rapidly bridging funds to multiple chains.", options: [{key:"A", label:"Wallet Freeze"},{key:"B", label:"Increase Gas Fees"},{key:"C", label:"Transaction Delay"}], correctKey: "C", explanation: "Delaying transfers gives Operators time to investigate before funds leave the network." },
  { id: "6", title: "Oracle Manipulation via Low Liquidity Pool", alert: "A tiny AMM pool is suddenly used to feed price data into Protocol A’s lending market.", options: [{key:"A", label:"Oracle Freeze"},{key:"B", label:"Transaction Delay"},{key:"C", label:"Wallet Freeze"}], correctKey: "A", explanation: "Freezing the oracle prevents price manipulation via low-liquidity pools." },
  { id: "7", title: "Admin Key Compromise", alert: "The admin wallet of Protocol B is initiating transfers at odd hours, draining funds.", options: [{key:"A", label:"Contract Rollback"},{key:"B", label:"Wallet Freeze"},{key:"C", label:"Gas Increase"}], correctKey: "B", explanation: "Freezing the compromised admin wallet stops unauthorized drains." },
  { id: "8", title: "Malicious Token Airdrop", alert: "Thousands of wallets receive airdropped tokens with hidden malicious approvals.", options: [{key:"A", label:"Block Token Interactions"},{key:"B", label:"Oracle Freeze"},{key:"C", label:"Mint More Safe Tokens"}], correctKey: "A", explanation: "Blocking token interactions buys time before users unknowingly approve exploits." },
  { id: "9", title: "Bridge Exploit Detected", alert: "A bridge contract is issuing tokens without receiving locked assets on the other chain.", options: [{key:"A", label:"Pause Bridge Function"},{key:"B", label:"Increase Gas Fees"},{key:"C", label:"Reward Validators with NFTs"}], correctKey: "A", explanation: "Pausing the bridge prevents further unbacked minting." },
  { id: "10", title: "Reentrancy Exploit", alert: "Repeated withdrawal calls detected from a vulnerable staking contract.", options: [{key:"A", label:"Contract Rollback"},{key:"B", label:"Pause Function"},{key:"C", label:"Transaction Delay"}], correctKey: "B", explanation: "Pausing halts the reentrancy loop before funds are drained." },
  { id: "11", title: "Suspicious Governance Concentration", alert: "A single wallet accumulated 51% of voting tokens just before a proposal window.", options: [{key:"A", label:"Voting Delay"},{key:"B", label:"Wallet Freeze"},{key:"C", label:"Oracle Freeze"}], correctKey: "A", explanation: "Delaying governance execution gives time to investigate vote manipulation." },
  { id: "12", title: "Phishing Contract Deployment", alert: "A copycat contract was deployed with a nearly identical address to Protocol C.", options: [{key:"A", label:"Blacklist Contract"},{key:"B", label:"Oracle Freeze"},{key:"C", label:"Wallet Freeze"}], correctKey: "A", explanation: "Blacklisting prevents interactions with the malicious clone." },
  { id: "13", title: "Treasury Drain Proposal", alert: "A DAO proposal attempts to move 80% of treasury funds to a multisig with unknown signers.", options: [{key:"A", label:"Voting Delay"},{key:"B", label:"Contract Rollback"},{key:"C", label:"Mint Extra Treasury Tokens"}], correctKey: "A", explanation: "Delaying prevents execution until the proposal is reviewed." },
  { id: "14", title: "Suspicious NFT Contract Upgrade", alert: "NFT marketplace contract upgraded with functions allowing free minting.", options: [{key:"A", label:"Contract Rollback"},{key:"B", label:"Wallet Freeze"},{key:"C", label:"Pause Function"}], correctKey: "A", explanation: "Rolling back cancels the malicious upgrade." },
  { id: "15", title: "Multi-Chain Drain Attempt", alert: "Funds are being bridged out simultaneously across four chains.", options: [{key:"A", label:"Multi-Chain Transaction Delay"},{key:"B", label:"Oracle Freeze"},{key:"C", label:"Increase Gas Fees"}], correctKey: "A", explanation: "Delaying bridge transactions gives operators time to investigate." },
  { id: "16", title: "Suspicious Contract Creator", alert: "A new contract requests admin-like roles from users and is trending on socials with dApp links.", options: [{key:"A", label:"Blacklist Contract"},{key:"B", label:"Block Token Interactions"},{key:"C", label:"Voting Delay"}], correctKey: "B", explanation: "Blocking token interactions prevents mass approvals and mitigates rug pulls." },
  { id: "17", title: "Rapid Approval Spikes", alert: "Thousands of wallets approve a single contract within minutes.", options: [{key:"A", label:"Wallet Freeze"},{key:"B", label:"Block Token Interactions"},{key:"C", label:"Oracle Freeze"}], correctKey: "B", explanation: "Blocking interactions prevents immediate exploit via mass approvals." },
  { id: "18", title: "Validator Collusion Alert", alert: "Multiple validators report conflicting block states indicating possible collusion.", options: [{key:"A", label:"Pause Function"},{key:"B", label:"Increase Gas Fees"},{key:"C", label:"Voting Delay"}], correctKey: "A", explanation: "Pausing critical functions reduces risk while validator issues are resolved." },
  { id: "19", title: "Liquidity Pool Rugging Pattern", alert: "A token's liquidity pair shows sudden removal of paired assets right after price pumping.", options: [{key:"A", label:"Pause Function"},{key:"B", label:"Oracle Freeze"},{key:"C", label:"Wallet Freeze"}], correctKey: "A", explanation: "Pausing swaps or withdrawals prevents immediate rugging." },
  { id: "20", title: "Unknown Contract Approval Sweep", alert: "An unknown contract has approvals to spend tokens from many high-value wallets.", options: [{key:"A", label:"Wallet Freeze"},{key:"B", label:"Block Token Interactions"},{key:"C", label:"Transaction Delay"}], correctKey: "B", explanation: "Blocking interactions halts the approval sweep and prevents unauthorized transfers." },
];

// ------------------------- Sounds -------------------------
const soundCorrect = new Howl({ src: ["/sounds/correct.mp3"], volume: 0.6 });
const soundWrong = new Howl({ src: ["/sounds/wrong.mp3"], volume: 0.6 });
const soundPass = new Howl({ src: ["/sounds/pass.mp3"], volume: 0.7 });
const soundFinish = new Howl({ src: ["/sounds/finish.mp3"], volume: 0.8 });

// ------------------------- Confetti -------------------------
import Confetti from "react-confetti";

// ------------------------- Game Component -------------------------
export default function Page() {
  const [route, setRoute] = useState<"splash"|"enter"|"levels"|"play"|"finish">("splash");
  const [name, setName] = useState("");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlocked, setUnlocked] = useState(1);
  const [triesLeft, setTriesLeft] = useState(2);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentScenario = SCENARIOS.find((s) => s.id === String(currentLevel));

  const handleAnswer = (key: string) => {
    if (!currentScenario || revealed) return;
    setSelectedKey(key);
    setRevealed(true);
    if (key === currentScenario.correctKey) {
      soundCorrect.play();
      soundPass.play();
      setUnlocked(Math.max(unlocked, currentLevel + 1));
      setTimeout(() => {
        if (currentLevel >= SCENARIOS.length) {
          setFinished(true);
          soundFinish.play();
          setRoute("finish");
        } else {
          alert(`Congrats 👏🏾 You passed Level ${currentScenario.id}`);
          setRoute("levels");
        }
      }, 800);
    } else {
      soundWrong.play();
      setTriesLeft(triesLeft - 1);
      if (triesLeft - 1 <= 0) {
        setTimeout(() => {
          alert(`You're out of tries for Level ${currentScenario.id}. Resetting tries.`);
          setTriesLeft(2);
          setRoute("levels");
        }, 500);
      }
    }
  };

  const resetGame = () => {
    setName("");
    setCurrentLevel(1);
    setUnlocked(1);
    setTriesLeft(2);
    setRoute("splash");
  };

  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center">
      {route === "splash" && (
        <div className="text-center text-white">
          <Image src="/logo.png" alt="Trap Net" width={240} height={240} />
          <h1 className="text-6xl font-bold mt-6">TRAP NET</h1>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setRoute("enter")} className="mt-8 px-8 py-4 bg-red-600 rounded-xl text-xl font-bold shadow-xl">New Game</motion.button>
        </div>
      )}

      {route === "enter" && (
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Enter Discord Name</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Discord handle" className="w-full p-3 border rounded-xl mb-4" />
          <button onClick={() => name ? setRoute("levels") : alert("Enter name")} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">Continue</button>
        </div>
      )}

      {route === "levels" && (
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-6">Select Level</h2>
          <div className="grid grid-cols-5 gap-4">
            {SCENARIOS.map((s) => {
              const locked = Number(s.id) > unlocked;
              return (
                <button key={s.id} onClick={() => { if (!locked) { setCurrentLevel(Number(s.id)); setRoute("play"); } }} className={`px-4 py-3 rounded-xl font-semibold ${locked ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-orange-100 hover:bg-orange-200"}`}>
                  {`Level ${s.id}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {route === "play" && currentScenario && (
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-2">Level {currentScenario.id} — {currentScenario.title}</h2>
          <p className="mb-4 text-gray-700">{currentScenario.alert}</p>
          {currentScenario.options.map((opt) => {
            const isAnswer = revealed && opt.key === currentScenario.correctKey;
            const isWrong = revealed && selectedKey === opt.key && !isAnswer;
            return (
              <button key={opt.key} onClick={() => handleAnswer(opt.key)} disabled={revealed} className={`block w-full text-left px-4 py-3 rounded-xl border mb-2 ${isAnswer ? "bg-green-100 border-green-500" : isWrong ? "bg-red-100 border-red-500" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
                {opt.key}) {opt.label}
              </button>
            );
          })}
          {revealed && (
            <p className="mt-4 text-sm text-gray-600">Answer: {currentScenario.correctKey} — {currentScenario.explanation}</p>
          )}
        </div>
      )}

      {route === "finish" && (
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg text-center">
          <Image src="/logo.png" alt="Trap Net" width={200} height={200} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">YOU ARE NOW A CERTIFIED TRAPPER</h2>
          <p className="mb-6">Congrats {name}! You’ve completed all levels 🎉</p>
          <Confetti recycle={false} numberOfPieces={400} />
          <div className="flex justify-center gap-4 mb-6">
            <TwitterShareButton title="I just became a Certified Trapper on Trap Net by Drosera Network! 🛡️" url={typeof window !== "undefined" ? window.location.href : ""}>
              <TwitterIcon size={48} round />
            </TwitterShareButton>
          </div>
          <button onClick={resetGame} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold">Play Again</button>
        </div>
      )}
    </div>
  );
                                                                                                                                                                 }
