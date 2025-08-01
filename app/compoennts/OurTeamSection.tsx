import React from "react";
import Image from "next/image";

const teamMembers = [
  {
    picture: "/team3.jpg",
    fullName: "Charles Brabham",
    designation: "CEO & Founder",
    bio: "Subscribe Easy Tutorials Youtube Channel watch more videos",
  },
  {
    picture: "/team1.jpg",
    fullName: 'Mekonnen "Mike" Habte',
    designation: "Lead Chauffeur",
    bio: "Subscribe Easy Tutorials Youtube Channel watch more videos",
  },
  {
    picture: "/team2.jpg",
    fullName: "Robert Seltzer",
    designation: "Senior VIP Chauffeur",
    bio: "Subscribe Easy Tutorials Youtube Channel watch more videos",
  },
];

const TeamMemberItem = ({
  member,
}: {
  member: (typeof teamMembers)[number];
}) => (
  <>
    <div className="bg-white max-w-[340px] dark:bg-slate-800 shadow-xl rounded-2xl mx-auto md-mx-0">
      <div>
        <div className="w-full h-80 rounded-t-2xl relative overflow-hidden">
          <Image
            src={member.picture}
            alt={member.fullName}
            className="object-cover object-top"
            fill
          />
        </div>
        <div className="p-3">
          <h5 className="text-xl mb-1 font-bold">{member.fullName}</h5>
          <p className="text-sm opacity-75">{member.designation}</p>
        </div>
      </div>
    </div>
  </>
);

const OurTeamSection = () => {
  return (
    <section className="light py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white">
      <div className="container px-4 mx-auto">
        <div className="flex justify-center mb-6 md:mb-12">
          <div className="sm:max-w-md text-center">
            <h2 className="text-2xl md:text-4xl text-center font-bold leading-none mb-4">
              Our Experts Team
            </h2>
            <p>
              Combined 60+ years of experience in executive transportation, our
              team is dedicated to providing exceptional service and safety.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center ">
          {teamMembers.map((member, i) => (
            <div className="col-span-3 md:col-span-2 lg:col-span-1" key={i}>
              <TeamMemberItem member={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default OurTeamSection;
