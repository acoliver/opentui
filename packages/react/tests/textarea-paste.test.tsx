import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test"
import { useRef, useEffect } from "react"
import type { TextareaRenderable, PasteEvent } from "@opentui/core"
import { testRender } from "../src/test-utils"

let testSetup: Awaited<ReturnType<typeof testRender>>

describe("React Textarea - Paste Tests", () => {
  beforeEach(async () => {
    if (testSetup) {
      testSetup.renderer.destroy()
    }
  })

  afterEach(() => {
    if (testSetup) {
      testSetup.renderer.destroy()
    }
  })

  describe("Bracketed Paste via onPaste prop", () => {
    it("should receive paste events via onPaste prop", async () => {
      let pasteEventReceived: PasteEvent | null = null
      let textareaRef: TextareaRenderable | null = null

      function TestComponent() {
        const ref = useRef<TextareaRenderable>(null)

        useEffect(() => {
          if (ref.current) {
            textareaRef = ref.current
            ref.current.focus()
          }
        }, [])

        return (
          <textarea
            ref={ref}
            focused
            initialValue="Hello"
            onPaste={(event: PasteEvent) => {
              pasteEventReceived = event
            }}
            style={{ width: 40, height: 10 }}
          />
        )
      }

      testSetup = await testRender(<TestComponent />, {
        width: 80,
        height: 24,
      })

      await testSetup.renderOnce()

      // Ensure textarea is focused and available
      expect(textareaRef).not.toBeNull()
      expect(textareaRef!.focused).toBe(true)

      // Simulate bracketed paste
      await testSetup.mockInput.pasteBracketedText(" World")

      // The onPaste callback should have been called
      expect(pasteEventReceived).not.toBeNull()
      expect(pasteEventReceived!.text).toBe(" World")
    })

    it("should insert pasted text into textarea when onPaste does not preventDefault", async () => {
      let textareaRef: TextareaRenderable | null = null

      function TestComponent() {
        const ref = useRef<TextareaRenderable>(null)

        useEffect(() => {
          if (ref.current) {
            textareaRef = ref.current
            ref.current.focus()
            ref.current.gotoLine(9999) // Move to end
          }
        }, [])

        return (
          <textarea
            ref={ref}
            focused
            initialValue="Hello"
            onPaste={(event: PasteEvent) => {
              // Don't prevent default - text should be inserted
            }}
            style={{ width: 40, height: 10 }}
          />
        )
      }

      testSetup = await testRender(<TestComponent />, {
        width: 80,
        height: 24,
      })

      await testSetup.renderOnce()

      expect(textareaRef).not.toBeNull()

      await testSetup.mockInput.pasteBracketedText(" World")

      expect(textareaRef!.plainText).toBe("Hello World")
    })

    it("should not insert pasted text when onPaste calls preventDefault", async () => {
      let textareaRef: TextareaRenderable | null = null

      function TestComponent() {
        const ref = useRef<TextareaRenderable>(null)

        useEffect(() => {
          if (ref.current) {
            textareaRef = ref.current
            ref.current.focus()
            ref.current.gotoLine(9999)
          }
        }, [])

        return (
          <textarea
            ref={ref}
            focused
            initialValue="Hello"
            onPaste={(event: PasteEvent) => {
              event.preventDefault()
            }}
            style={{ width: 40, height: 10 }}
          />
        )
      }

      testSetup = await testRender(<TestComponent />, {
        width: 80,
        height: 24,
      })

      await testSetup.renderOnce()

      expect(textareaRef).not.toBeNull()

      await testSetup.mockInput.pasteBracketedText(" Blocked")

      // Text should NOT be inserted because preventDefault was called
      expect(textareaRef!.plainText).toBe("Hello")
    })

    it("should work without onPaste prop (default paste behavior)", async () => {
      let textareaRef: TextareaRenderable | null = null

      function TestComponent() {
        const ref = useRef<TextareaRenderable>(null)

        useEffect(() => {
          if (ref.current) {
            textareaRef = ref.current
            ref.current.focus()
            ref.current.gotoLine(9999)
          }
        }, [])

        return (
          <textarea
            ref={ref}
            focused
            initialValue="Hello"
            style={{ width: 40, height: 10 }}
          />
        )
      }

      testSetup = await testRender(<TestComponent />, {
        width: 80,
        height: 24,
      })

      await testSetup.renderOnce()

      expect(textareaRef).not.toBeNull()

      await testSetup.mockInput.pasteBracketedText(" World")

      // Default behavior should insert the pasted text
      expect(textareaRef!.plainText).toBe("Hello World")
    })
  })
})
