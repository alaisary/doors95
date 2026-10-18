// Scenarios that have an "attacker's view" slide, shown before the debrief when the visitor was compromised.
// Add an id here and a scene component in components/slides/scenes to give another scenario the slide.
export const ATTACKER_SLIDES = new Set<string>(['evilginx-bitb', 'device-code', 'ejada', 'clickfix', 'zoom-docs', 'ironcastle'])
export const hasAttackerSlide = (id: string) => ATTACKER_SLIDES.has(id)
