/** Extra fixtures the chart sections share, beyond `sales` and `share`. */
export const radar = [
  { axis: "Speed", planA: 80, planB: 55 },
  { axis: "Cost", planA: 45, planB: 70 },
  { axis: "Quality", planA: 90, planB: 60 },
  { axis: "Reach", planA: 55, planB: 85 },
  { axis: "Risk", planA: 30, planB: 50 },
];

export const funnel = [
  { stage: "Visits", count: 1000 },
  { stage: "Signups", count: 420 },
  { stage: "Trials", count: 180 },
  { stage: "Paid", count: 60 },
];

export const flow = {
  nodes: [
    { name: "Ads" },
    { name: "Search" },
    { name: "Signup" },
    { name: "Paid" },
    { name: "Churn" },
  ],
  links: [
    { source: 0, target: 2, value: 30 },
    { source: 1, target: 2, value: 50 },
    { source: 2, target: 3, value: 45 },
    { source: 2, target: 4, value: 35 },
  ],
};

export const chord = {
  nodes: [{ name: "Design" }, { name: "Build" }, { name: "Test" }, { name: "Ship" }],
  links: [
    { source: 0, target: 1, value: 12 },
    { source: 1, target: 2, value: 8 },
    { source: 2, target: 3, value: 15 },
    { source: 3, target: 0, value: 6 },
  ],
};
