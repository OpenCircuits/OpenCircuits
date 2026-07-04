import {ChangelogPopup} from "shared/site/containers/ChangelogPopup";
import "./index.scss";

export const DigitalChangelogPopup = () => {
    return (
        <ChangelogPopup version="4.0.0" cookieKey="DIGITAL_VERSION">
            <div className="digital-changelog">
                <div className="digital-changelog__header">
                    <span className="digital-changelog__icon">🚀</span>
                    <h2>Version 4.0.0</h2>
                    <span className="digital-changelog__subtitle">The Model Refactor</span>
                </div>
                
                <p className="digital-changelog__intro">
                    Welcome to OpenCircuits v4.0! This release includes a massive refactor of the underlying codebase which brings dramatic improvements to the app's performance and efficiency.
                </p>

                <div className="digital-changelog__grid">
                    <div className="digital-changelog__card">
                        <div className="digital-changelog__card-icon">💾</div>
                        <div className="digital-changelog__card-content">
                            <h3>30-100x Smaller Files</h3>
                            <p>A completely rewritten model representation drastically reduces saved circuit file sizes!</p>
                        </div>
                    </div>

                    <div className="digital-changelog__card">
                        <div className="digital-changelog__card-icon">🕰️</div>
                        <div className="digital-changelog__card-content">
                            <h3>History Box Upgrades</h3>
                            <p>The history box is now draggable, resizable, and includes redo history.</p>
                        </div>
                    </div>

                    <div className="digital-changelog__card">
                        <div className="digital-changelog__card-icon">✨</div>
                        <div className="digital-changelog__card-content">
                            <h3>UX Improvements</h3>
                            <p>Double click to select all connected components, drag items to the navbar to quickly delete them, and snap-to-grid.</p>
                        </div>
                    </div>

                    <div className="digital-changelog__card">
                        <div className="digital-changelog__card-icon">⚡</div>
                        <div className="digital-changelog__card-content">
                            <h3>Better Interaction</h3>
                            <p>Added a "New Circuit" button, more context actions, and the ability to change input sizes for multiple gates at once.</p>
                        </div>
                    </div>

                    <div className="digital-changelog__card">
                        <div className="digital-changelog__card-icon">📈</div>
                        <div className="digital-changelog__card-content">
                            <h3>Analog Preview</h3>
                            <p>Began the initial implementation of Analog circuits (OpenCircuitsEE).</p>
                        </div>
                    </div>

                    <div className="digital-changelog__card">
                        <div className="digital-changelog__card-icon">🛠️</div>
                        <div className="digital-changelog__card-content">
                            <h3>Bug Fixes Galore</h3>
                            <p>Tons of fixes for SVG rendering, iOS/Safari issues, bounding boxes, and wire splitting bugs.</p>
                        </div>
                    </div>
                </div>

                <div className="digital-changelog__footer">
                    <p>
                        <i>Since this is a massive underlying rewrite, there may be some lingering bugs. If you experience any issues or weird behavior, please don't hesitate to <a href="https://github.com/OpenCircuits/OpenCircuits/issues" target="_blank" rel="noreferrer">open an issue</a> on our GitHub repository!</i>
                    </p>
                </div>
            </div>
        </ChangelogPopup>
    );
};
