// Tutorial script
export const TUTORIAL_STEPS = [
    {
        text: ['WELCOME TO THE AMASS AIRSHIP SIMULATOR',
            'You are about to pilot a real research blimp.',
            '',
            'Press SPACE to continue'],
        action: 'space',
        lock: true
    }
];

export function resetTutorial() {
    tutorialStep = 0;
}