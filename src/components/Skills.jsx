import {
  SiC, SiCplusplus, SiPython, SiJavascript,
  SiExpress, SiReact, SiNodedotjs, SiEjs, SiBootstrap,
  SiAndroid, SiTensorflow, SiOpencv,
  SiDjango, SiFlask, SiGit, SiGithub,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { skillGroups } from '../data/content';
import Reveal from './Reveal';

const ICON_MAP = {
  SiC, SiCplusplus, SiPython, SiJavascript,
  SiExpress, SiReact, SiNodedotjs, SiEjs, SiBootstrap,
  SiAndroid, SiTensorflow, SiOpencv,
  SiDjango, SiFlask, SiGit, SiGithub,
  DiJava,
};

function SkillChip({ skill }) {
  const IconComp = skill.icon ? ICON_MAP[skill.icon] : null;
  return (
    <div className="skill-chip">
      {skill.image ? (
        <img className="skill-chip__logo" src={skill.image} alt="" />
      ) : IconComp ? (
        <IconComp size={15} style={{ color: skill.color, flexShrink: 0 }} />
      ) : skill.text ? (
        <span className="skill-chip__text-icon" style={{ color: skill.color }}>{skill.text}</span>
      ) : null}
      <span>{skill.name}</span>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="section__inner">
        <Reveal className="section__head">
          <span className="eyebrow">&lt;Skills/&gt;</span>
          <h2 className="section__title">
            What I work <span className="accent">with</span>
          </h2>
          <p className="section__lede">
            Languages, frameworks, and tools I reach for when building web apps, mobile apps,
            and the occasional AI experiment.
          </p>
        </Reveal>

        <Reveal as="div" stagger className="skills-grid">
          {skillGroups.map(group => (
            <div className="skill-card" key={group.id}>
              <span className="skill-card__tag">{group.tag}</span>
              <h3 className="skill-card__title">{group.label}</h3>
              <div className="skill-card__list">
                {group.skills.map(skill => (
                  <SkillChip key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
