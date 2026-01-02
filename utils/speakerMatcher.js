// frontend/src/utils/speakerMatcher.js

export function normalizeArabicName(name) {
  if (!name) return "";

  return name
    .replace(/النائب|الوزير|وزير|رئيس|الدكتور|د\./g, "")
    .replace(/[^\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchSpeakerToMP(rawSpeakerName, mps) {
  const cleanSpeaker = normalizeArabicName(rawSpeakerName);

  return (
    mps.find(mp => {
      const mpName = normalizeArabicName(mp.name);
      return (
        mpName.includes(cleanSpeaker) ||
        cleanSpeaker.includes(mpName)
      );
    }) || null
  );
}
