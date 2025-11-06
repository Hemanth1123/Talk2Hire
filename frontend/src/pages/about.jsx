import "../styles/About.css";

export default function About() {
  return (
    <div className="about-container">
      <div className="about-card">
        <h1>About Hack2Hire</h1>
        <p>
          <strong>Hack2Hire</strong> is an intelligent interview management and
          preparation platform built to bridge the gap between talent and
          opportunity. It allows learners and job seekers to schedule, attend,
          and evaluate mock interviews — helping them refine both technical and
          communication skills with confidence.
        </p>

        <p>
          With a focus on automation, AI-driven evaluation, and structured
          learning flow, Hack2Hire simplifies how interviews are organized,
          managed, and reviewed by both users and administrators.
        </p>

        <p>
          Our goal is to create a seamless and empowering platform that enhances
          every learner’s journey toward becoming interview-ready.
        </p>

        <p className="guided">
          Guided by <strong>Mr. M. Raja Sekar</strong> and{" "}
          <strong>Mr. M. Rajasekaran</strong>
        </p>
      </div>
    </div>
  );
}
