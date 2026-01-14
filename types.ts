import React from 'react';

export interface WheelData {
  career: number;
  finances: number;
  health: number;
  family: number;
  relationships: number;
  growth: number;
  fun: number;
  contribution: number;
}

export interface ActionPlanRow {
  goal: string;
  steps: string[];
  timeline: string;
  support: string;
}

export interface GrowthRoadmapState {
  name: string;
  team: string;
  strengths: string[];
  gaps: string[];
  mainGoal: string;
  feeling: string;
  plans: ActionPlanRow[];
}

export interface Slide {
  id: number;
  title: string;
  content: string | React.ReactNode;
  theme: 'blue' | 'emerald' | 'orange' | 'dark';
  section?: string;
}

export type WorksheetType = 'WHEEL' | 'IDP' | 'SLIDES';