import {expect, test} from "vitest";
import {computed, effect, signal} from "../src/signal";

test("that calling a signal returns it's value", () => {
    expect(signal(1)()).toBe(1)
})

test("that a new value can be set on a signal", () => {
    const testSignal = signal(1)
    testSignal.set(2)
    expect(testSignal()).toBe(2)
})

test("that the value of the signal can be updated based on its current value", () => {
    const testSignal = signal(1)
    testSignal.update((value: number) => value * 2)
    expect(testSignal()).toBe(2)
})

test("that each signal has a unique symbol", () => {
    const a = signal(1)
    const b = signal(1)

    expect(a.symbol).toBe(a.symbol)
    expect(a.symbol).not.toBe(b.symbol)
})

/**
 * Computed
 */

test("that computed signal has correct value", () => {
    const sourceSignal = signal(1)
    const computedSignal = computed(() => sourceSignal() + 1)

    expect(computedSignal()).toBe(2)

    sourceSignal.set(2)
    expect(computedSignal()).toBe(3)
})

test("that computed signal is read only", () => {
    const computedSignal = computed(() => {
    })
    expect(() => computedSignal.set(1)).toThrow()
    expect(() => computedSignal.update(() => () => {
    })).toThrow()
})

/**
 * Effects
 */

test("that an effect without any signals to watch throws an error", () => {
    expect(() => effect(() => {
    }, [])).toThrow()
})

test("that an effect will be actioned when a watched signal is updated", () => {
    let test = 0
    const testSignal = signal(1)
    effect(() => test += 1, [testSignal])
    testSignal.set(2)
    expect(test).toBe(1)

    testSignal.update((currentValue) => currentValue + 1)
    expect(test).toBe(2)
})

test("that an effect will not be actioned when an unwatched signal is updated", () => {
    let test = 0
    const testSignal = signal(1)
    const otherSignal = signal(1)
    effect(() => test += 1, [testSignal])
    otherSignal.set(2)
    expect(test).toBe(0)

    otherSignal.update((currentValue) => currentValue + 1)
    expect(test).toBe(0)
})
