import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface QuizContextType {
    isQuizInProgress: boolean;
    setQuizInProgress: (value: boolean) => void;
    attemptNavigation: (navigateCallback: () => void) => void;
    showLeaveWarning: boolean;
    setShowLeaveWarning: (value: boolean) => void;
    pendingNavigation: (() => void) | null;
    setPendingNavigation: (callback: (() => void) | null) => void;
    confirmLeave: () => void;
    cancelLeave: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isQuizInProgress, setIsQuizInProgress] = useState(false);
    const [showLeaveWarning, setShowLeaveWarning] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    const attemptNavigation = useCallback((navigateCallback: () => void) => {
        if (isQuizInProgress) {
            setPendingNavigation(() => navigateCallback);
            setShowLeaveWarning(true);
        } else {
            navigateCallback();
        }
    }, [isQuizInProgress]);

    const confirmLeave = useCallback(() => {
        setIsQuizInProgress(false);
        setShowLeaveWarning(false);
        if (pendingNavigation) {
            pendingNavigation();
        }
        setPendingNavigation(null);
    }, [pendingNavigation]);

    const cancelLeave = useCallback(() => {
        setShowLeaveWarning(false);
        setPendingNavigation(null);
    }, []);

    return (
        <QuizContext.Provider
            value={{
                isQuizInProgress,
                setQuizInProgress: setIsQuizInProgress,
                attemptNavigation,
                showLeaveWarning,
                setShowLeaveWarning,
                pendingNavigation,
                setPendingNavigation,
                confirmLeave,
                cancelLeave,
            }}
        >
            {children}
        </QuizContext.Provider>
    );
};

export const useQuiz = () => {
    const context = useContext(QuizContext);
    if (context === undefined) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
};
