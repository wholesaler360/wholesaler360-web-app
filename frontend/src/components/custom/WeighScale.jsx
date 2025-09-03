import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function WeighingPanel({ onSave, initialCapturedWeight = 0 }) {
  const [currentWeight, setCurrentWeight] = useState("");
  const [capturedWeight, setCapturedWeight] = useState(initialCapturedWeight);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const socketRef = useRef(null);

  // Connect to weighing scale server on mount
  useEffect(() => {
    let socket;
    try {
      socket = new window.WebSocket("ws://127.0.0.1:8001/5001");
      socketRef.current = socket;
      socket.onopen = () => {
        setConnectionStatus("connected");
        // console.log("WebSocket connected");
      };
      socket.onmessage = (event) => {
        // console.log("WebSocket message:", event.data);
        const raw = event.data;
        const weight = parseFloat(raw) / 1000;
        setCurrentWeight(isNaN(weight) ? "" : weight.toFixed(3));
      };
      socket.onerror = (err) => {
        setConnectionStatus("error");
        setCurrentWeight("");
        // console.error("WebSocket error:", err);
      };
      socket.onclose = () => {
        setConnectionStatus("disconnected");
        setCurrentWeight("");
        // console.log("WebSocket closed");
      };
    } catch (err) {
      setConnectionStatus("error");
      setCurrentWeight("");
      // console.error("WebSocket exception:", err);
    }
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setCapturedWeight(initialCapturedWeight);
  }, [initialCapturedWeight]);

  // Add current weight to captured weight
  const handleAddWeight = () => {
    const weightNum = parseFloat(currentWeight) || 0;
    setCapturedWeight((prev) => +(prev + weightNum).toFixed(3));
  };

  // Reset captured weight
  const handleReset = () => {
    setCapturedWeight(0);
  };

  // Save captured weight (pass to parent)
  const handleSave = () => {
    if (onSave) onSave(capturedWeight);
  };

  return (
    <Card className="w-full">
      <CardContent className="flex flex-row items-center gap-6 py-4">
        <div className="flex flex-col items-start gap-2">
          <Label htmlFor="currentWeight">Current Weight (KG)</Label>
          <Input
            id="currentWeight"
            value={currentWeight}
            readOnly
            placeholder="0.000"
            className="w-32"
          />
          <div className="text-xs mt-1">
            {connectionStatus === "connecting" && "Connecting to scale..."}
            {connectionStatus === "connected" && !currentWeight && "Waiting for weight..."}
            {connectionStatus === "disconnected" && "Disconnected from scale."}
            {connectionStatus === "error" && "Error connecting to scale."}
          </div>
        </div>
        <Separator orientation="vertical" className="mx-4 h-16" />
        <div className="flex flex-col items-start gap-2">
          <Label htmlFor="capturedWeight">Captured Weight (KG)</Label>
          <Input
            id="capturedWeight"
            value={capturedWeight}
            readOnly
            placeholder="0.000"
            className="w-32"
          />
          <div className="flex gap-2 mt-2">
            <Button variant="default" size="sm" onClick={handleAddWeight} disabled={!currentWeight}>
              Add Weight
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSave} disabled={capturedWeight === 0}>
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}