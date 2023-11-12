type AnonymousFunction = (...args: any[]) => any

class Callable extends Function {
    constructor(func: AnonymousFunction) {
        super()
        return Object.setPrototypeOf(func, new.target.prototype);
    }
}

export class Effect {
    constructor(public callback: AnonymousFunction, public signalsToWatch: Set<Symbol> = new Set()) {
    }
}

export class Signal<T> extends Callable {
    symbol = Symbol()

    constructor(private value: T) {
        super(() => typeof this.value === 'function' ? this.value() : this.value)
    }

    set(value: T) {
        this.value = value
        SignalStore.update(this.symbol)
    }

    update(callback: (value: T) => T) {
        this.set(callback(this.value))
    }
}

export class ComputedSignal extends Signal<AnonymousFunction> {
    set(value: any) {
        throw new Error(`[value]: ${value}, cannot be set. A computed signal is read only.`)
    }
}

export class SignalStore {
    protected static signals: Map<Symbol, Signal<any>> = new Map()
    protected static effects: Set<Effect> = new Set()

    static createSignal<T>(value: T) {
        const signal = new Signal<T>(value)
        SignalStore.signals.set(signal.symbol, signal)
        return signal
    }

    static update(symbol: Symbol) {
        for (const effect of this.effects) {
            if (effect.signalsToWatch.has(symbol)) {
                effect.callback()
            }
        }
    }

    static createEffect(callback: AnonymousFunction, watch: Set<Symbol>) {
        const effect = new Effect(callback, watch);
        this.effects.add(effect)
    }

    static createComputed(callback: AnonymousFunction) {
        return new ComputedSignal(callback);
    }
}

export const signal = <T>(value: T) => SignalStore.createSignal(value)

export const computed = (callback: AnonymousFunction) => SignalStore.createComputed(callback)

export const effect = (callback: AnonymousFunction, signalsToWatch: Signal<any>[]) => {
    if (!signalsToWatch.length) throw new Error("An effect must have at least one signal to watch.");

    const symbols = new Set<Symbol>()
    for (const signal of signalsToWatch) {
        symbols.add(signal.symbol)
    }

    SignalStore.createEffect(callback, symbols)
}
