import React from "react";
import { useAuth } from "../context/AuthContext";

function Marquee() {
  const { skillsList } = useAuth();
  const activeSkills = Array.isArray(skillsList) ? skillsList : [];
  if (activeSkills.length === 0) return null;
  const marqueeItems = activeSkills.concat(activeSkills);

  return (
    <div className="marquee-wrap bg-bg2 border-y border-[var(--border)] py-3 overflow-hidden">
      <div className="marquee-inner">
        {marqueeItems.map((item, idx) => {
          const name = typeof item === "string" ? item : item.name;
          return (
            <span key={`${name}-${idx}`} className="m-item">
              {name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default Marquee;
