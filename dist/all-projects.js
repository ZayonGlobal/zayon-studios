import {projects as baseProjects} from './data.js';
import {additionalProjects} from './project-extensions.js';
import {projectOutcomes,projectStrategy} from './project-outcomes.js';
import {campaignGalleryKeep} from './curated.js';

// Graphic design work is shown as part of Social media.
const asSocial=project=>project.category==='graphic'?{...project,category:'social',type:'Social media design'}:project;

export const projects=[...baseProjects,...additionalProjects].map(asSocial).map(project=>{
  const keep=campaignGalleryKeep[project.slug];
  const gallery=keep?keep.map(index=>project.gallery[index]).filter(Boolean):project.gallery;
  const enriched=gallery===project.gallery?project:{...project,gallery};
  const withOutcome=projectOutcomes[project.slug]?{...enriched,outcome:projectOutcomes[project.slug]}:enriched;
  return projectStrategy[project.slug]?{...withOutcome,strategy:projectStrategy[project.slug]}:withOutcome;
});
