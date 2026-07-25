import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  format?: string;
  title?: string;
}

interface State {
  error: Error | null;
}

/**
 * RendererErrorBoundary isolates a single rendered artifact so a thrown
 * renderer error never blanks the whole room page. It surfaces the failure
 * inline with a Retry affordance that resets the boundary.
 */
export class RendererErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Keep a console breadcrumb without crashing the tree.
    console.error("[RendererErrorBoundary] renderer failed:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-xs font-semibold text-red-400">
            Renderer failed{this.props.title ? ` — ${this.props.title}` : ""}
            {this.props.format ? ` (${this.props.format})` : ""}
          </p>
          <p className="text-[10px] text-gv-text-secondary">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-1 rounded-lg border border-white/10 px-3 py-1 text-[10px] text-gv-text-secondary transition-colors hover:text-white"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RendererErrorBoundary;
