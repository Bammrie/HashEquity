// Editable config for game objects. The array is exposed on the window as
// `OBJECTS` so that the game logic can consume it without a build step.
const OBJECTS = [
  { id: 1, name: "Base", image: "images/Object0-1.png", reward: 0.00000001, chance: 60 },
  { id: 2, name: "Blue", image: "images/Object0-2.png", reward: 0.00000003, chance: 20 },
  { id: 3, name: "Red", image: "images/Object0-3.png", reward: 0.00000005, chance: 6 },
  { id: 4, name: "Gold", image: "images/Object0-4.png", reward: 0.0000001, chance: 4 },
  { id: 5, name: "Rainbow", image: "images/Object0-5.png", reward: 0.0000025, chance: 2 },
  { id: 6, name: "Rainbow", image: "images/Object0-6.png", reward: 0.0000025, chance: 2 },
  { id: 7, name: "Base", image: "images/Object0-7.png", reward: 0.00000001, chance: 1 },
  { id: 8, name: "Blue", image: "images/Object0-8.png", reward: 0.00000003, chance: 1 },
  { id: 9, name: "Red", image: "images/Object0-9.png", reward: 0.00000005, chance: 1 },
  { id: 10, name: "Gold", image: "images/Object1-0.png", reward: 0.0000001, chance: 1 },
  { id: 11, name: "Rainbow", image: "images/Object1-1.png", reward: 0.0000025, chance: 1 },
  { id: 12, name: "Rainbow", image: "images/Object1-2.png", reward: 0.0000025, chance: 0.5 },
  { id: 13, name: "Base", image: "images/Object1-3.png", reward: 0.00000001, chance: 0.5 },
  { id: 14, name: "Blue", image: "images/Object1-4.png", reward: 0.00000003, chance: 0.5 },
  { id: 15, name: "Red", image: "images/Object1-5.png", reward: 0.00000005, chance: 0.5 },
  { id: 16, name: "Gold", image: "images/Object1-6.png", reward: 0.0000001, chance: 0.5 },
  { id: 17, name: "Rainbow", image: "images/Object1-7.png", reward: 0.0000025, chance: 0.25 },
  { id: 18, name: "Rainbow", image: "images/Object1-8.png", reward: 0.0000025, chance: 0.25 },
  { id: 19, name: "Gold", image: "images/Object1-9.png", reward: 0.0000001, chance: 0.25 },
  { id: 20, name: "Rainbow", image: "images/Object2-0.png", reward: 0.0000025, chance: 0.25 },
];

window.OBJECTS = OBJECTS;
