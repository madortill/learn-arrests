import React, { useState } from 'react';
import Stages from '../stages.json';
import About from '../About/About';
import Levels, { LevelsBtn } from '../Levels/Levels';
import ReturnBtn from '../ReturnBtn/ReturnBtn'; 

import BookendScreen from '../BookendScreen/BookendScreen';
import SpeechBubble from '../SpeechBubble/SpeechBubble';
import Tablet from '../Tablet/Tablet';
import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';


const components = {
    BookendScreen: BookendScreen,
    SpeechBubble: SpeechBubble,
    Tablet: Tablet,
    WhatsAppChat: WhatsAppChat,
};

export default function System() {
    const [currentNumStep, setCurrentNumStep] = useState(0);
    const [isLevelsOpen, setIsLevelsOpen] = useState(false);
    const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);

    const currentStepData = Stages.pages[currentNumStep];
    const Component = components[currentStepData.primaryComponent.type];

    if (!Component) {
        return <div>Component not found: {currentStepData.primaryComponent.type}</div>;
    }

    const handleNextStep = () => {
        if (currentNumStep < Stages.pages.length - 1) {
            const nextStep = currentNumStep + 1;
            setCurrentNumStep(nextStep);
            if (nextStep > maxUnlockedStep) {
                setMaxUnlockedStep(nextStep);
            }
        }
    };

    // 2. פונקציה לחזרה לשלב הקודם
    const handlePrevStep = () => {
        if (currentNumStep > 0) {
            setCurrentNumStep(prev => prev - 1);
        }
    };

    const restart = () => {
        setCurrentNumStep(1);
    };

    return (
        <>
            <About />
            
            <LevelsBtn 
                isOpen={isLevelsOpen} 
                onClick={() => setIsLevelsOpen(!isLevelsOpen)} 
            />

            {/* 3. הכפתור יוצג אך ורק החל משלב 1 ואילך (לא במסך הפתיחה 0) */}
            {currentNumStep > 0 && (
                <ReturnBtn onClick={handlePrevStep} />
            )}

            <Levels 
                steps={Stages.pages} 
                currentStep={currentNumStep}
                maxUnlockedStep={maxUnlockedStep}
                isOpen={isLevelsOpen}
                onClose={() => setIsLevelsOpen(false)}
                onSelectStep={(stepIndex) => setCurrentNumStep(stepIndex)} 
            />
            
            <Component 
                {...currentStepData.primaryComponent.props} 
                onNext={handleNextStep} 
                onRestart={restart} 
            />
        </>
    );
}