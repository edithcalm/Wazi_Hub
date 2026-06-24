/* WaziHub sectorPalette */
(function (g) {
  g.WaziData = g.WaziData || {};
  g.WaziData.sectorPalette = {
    "Health":"#ff6b35","Education":"#f7931e","Infrastructure":"#ffd23f","Agriculture":"#06d6a0",
    "Water & Sanitation":"#118ab2","Security":"#073b4c","Transport":"#7209b7","Energy":"#aacc00",
    "Governance":"#f94144","Environment":"#2a9d8f","Trade & Industry":"#f3722c","Tourism":"#43aa8b",
    "Youth Affairs":"#577590","Gender & Social Services":"#f8961e"
  };
})(typeof window !== 'undefined' ? window : globalThis);
(function (g) {
  g.WaziData.baseData = {
    "Health":{planned: 850e9, actual: 720e9},
    "Education":{planned: 920e9, actual: 850e9},
    "Infrastructure":{planned: 680e9, actual: 450e9},
    "Agriculture":{planned: 320e9, actual: 280e9},
    "Water & Sanitation":{planned: 280e9, actual: 230e9},
    "Security":{planned: 450e9, actual: 420e9},
    "Transport":{planned: 390e9, actual: 310e9},
    "Energy":{planned: 260e9, actual: 210e9},
    "Governance":{planned: 150e9, actual: 120e9},
    "Environment":{planned: 95e9, actual: 80e9},
    "Trade & Industry":{planned: 110e9, actual: 90e9},
    "Tourism":{planned: 70e9, actual: 52e9},
    "Youth Affairs":{planned: 55e9, actual: 40e9},
    "Gender & Social Services":{planned: 60e9, actual: 48e9}
  };
  g.WaziData.yearMul = {
    "2025/26":1.06,"2024/25":1.00,"2023/24":0.96,"2022/23":0.92,"2021/22":0.90,"2020/21":0.88,"2019/20":0.86,"2018/19":0.82
  };
  g.WaziData.countyScale = {
    default: 1.0, nairobi: 1.25, nakuru: 1.12, kiambu: 1.1, mombasa: 1.08, kakamega:1.06, kisumu:1.05
  };
})(typeof window !== 'undefined' ? window : globalThis);
