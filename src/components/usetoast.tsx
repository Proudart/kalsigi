"use client"

import exp from "constants"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"

export function ToastSimple() {
  const { toast } = useToast()
  return (
    <Button
      variant="outline"
      onClick={() => {
        toast({
          description: "Your message has been sent.",
        })
      }}
    >
      Show Toast
    </Button>
  )
}

export default ToastSimple