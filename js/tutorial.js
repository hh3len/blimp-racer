const TUTORIAL_KEY = 'tutorialComplete';
export let tutorialStep = 0;

// Tutorial script
export const TUTORIAL_STEPS = [
    {
        text: ['WELCOME TO THE AMASS AIRSHIP SIMULATOR',
            'Learn how to pilot a real research blimp.',
            '',
            'Press SPACE to continue'],
        action: 'space',
        lock: true
    }
];

export function advanceTutorial(onComplete) {
    tutorialStep++;
    if (tutorialStep >= TUTORIAL_STEPS.length) {
        completeTutorial(onComplete);
        return;
    }
}

export function getCurrentStep() {
    return TUTORIAL_STEPS[tutorialStep];
}

export function resetTutorial() {
    tutorialStep = 0;
}

export function hasCompletedTutorial() {
    return localStorage.getItem(TUTORIAL_KEY) === 'true';
}

function completeTutorial(onComplete) {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    if (onComplete) onComplete();
}