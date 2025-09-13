import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Progress } from "@/Components/ui/progress";
import { Badge } from "@/Components/ui/badge";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

export function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos en segundos
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);

    const totalTime = isBreak ? 5 * 60 : 25 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((timeLeft) => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (!isBreak) {
                setCompletedPomodoros((prev) => prev + 1);
                setIsBreak(true);
                setTimeLeft(5 * 60); // 5 minutos de descanso
            } else {
                setIsBreak(false);
                setTimeLeft(25 * 60); // Nuevo pomodoro
            }
            setIsActive(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, isBreak]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Pomodoro Timer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className="text-3xl font-mono font-bold mb-2">
                        {formatTime(timeLeft)}
                    </div>
                    <Badge
                        variant={isBreak ? "secondary" : "default"}
                        className="mb-3"
                    >
                        {isBreak ? "Descanso" : "Foco"}
                    </Badge>
                    <Progress value={progress} className="mb-4" />
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={toggleTimer}
                        className="flex-1"
                        variant={isActive ? "secondary" : "default"}
                    >
                        {isActive ? (
                            <Pause className="h-4 w-4 mr-1" />
                        ) : (
                            <Play className="h-4 w-4 mr-1" />
                        )}
                        {isActive ? "Pausar" : "Iniciar"}
                    </Button>
                    <Button onClick={resetTimer} variant="outline" size="icon">
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Pomodoros completados hoy:{" "}
                    <span className="font-semibold text-accent">
                        {completedPomodoros}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
