import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

// class Square extends React.Component {
//     render() {
//         return (
//             <button className="square" onClick={() => this.props.onClick()}>
//                 {this.props.value}
//             </button>
//         );
//     }
// }

function Square(props) {
    return (
        <button className="square" onClick={props.onClick} style={props.style}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                style={{ backgroundColor: this.props.color[i] }}
                key={i}
            />
        );
    }

    render() {
        const squares = [];
        for (let row = 0; row < 3; row++) {
            let boardRow = [];
            for (let column = 0; column < 3; column++) {
                boardRow.push(this.renderSquare(row * 3 + column));
            }
            const boardRowJsx = (
                <div className="board-row" key={row}>
                    {boardRow}
                </div>
            );
            squares.push(boardRowJsx);
        }
        return <div>{squares}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                    filledSquare: [],
                },
            ],
            color: Array(9).fill("transparent"),
            stepNumber: 0,
            xIsNext: true,
            isDesc: true,
        };
    }
    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const filledSquare = current.filledSquare.slice(
            0,
            this.state.stepNumber + 1
        );
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        filledSquare.push(i);
        this.setState({
            history: history.concat([
                { squares: squares, filledSquare: filledSquare },
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });

        this.setState(function (state, props) {
            const newSquares = state.history[state.history.length - 1].squares;
            const winnerSquares = calculateWinner(newSquares);
            if (winnerSquares) {
                let color = state.color.slice();
                winnerSquares.forEach((index) => {
                    color[index] = "yellow";
                });
                return { color: color };
            }
        });
    }
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0,
        });
    }
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        let color = Array(9).fill("transparent");
        const winnerSquares = calculateWinner(current.squares);
        let winner;
        if (winnerSquares) {
            winner = current.squares[winnerSquares[0]];
            color = this.state.color;
        }
        const moves = history.map((step, move) => {
            const desc = move ? `Go to move #${move}` : "Go to game start";
            const filled = step.filledSquare;
            const lastSquare = filled[filled.length - 1];
            const row = Math.floor(lastSquare / 3) + 1;
            const col = (lastSquare % 3) + 1;
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>
                        {desc} ({row} {col})
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = `winner: ${winner}`;
        } else if (
            !winner &&
            typeof current.squares.find((el) => el === null) === "undefined"
        ) {
            status = "draw !";
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }
        const isDesc = this.state.isDesc;
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        color={color}
                    />
                </div>
                <div className="game-info">
                    <div>
                        {status}
                        <button
                            type="button"
                            onClick={() => this.setState({ isDesc: !isDesc })}
                        >
                            click for arrange
                        </button>
                    </div>
                    <ol>{isDesc ? moves : moves.reverse()}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return [a, b, c];
        }
    }
    return null;
}
