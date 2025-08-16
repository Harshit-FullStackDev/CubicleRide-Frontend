import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError:false };
  }
  static getDerivedStateFromError(){ return { hasError:true }; }
  componentDidCatch(err, info){
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary', err, info);
  }
  handleReset = () => { this.setState({ hasError:false }); window.location.reload(); };
  render(){
    if (this.state.hasError){
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="text-gray-600 mb-6">Please refresh the page or try again later.</p>
          <button onClick={this.handleReset} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
