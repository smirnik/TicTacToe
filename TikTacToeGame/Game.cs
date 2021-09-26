using System;
using System.Collections.Generic;
using System.Linq;
using TikTacToeGame.Events;
using TikTacToeGame.Events.Status;

namespace TikTacToeGame
{
    public class Game : IGame
    {
        private readonly Mark[] _board = new Mark[9];
        private readonly IGameRulesChecker _winnerChecker;
        private readonly List<IPlayer> _players = new();
        private GameStatus _gameStatus;
        private Mark _nextMove;

        public GameStatus GameStatus { get => _gameStatus; private set => _gameStatus = value; }

        public event EventHandler<Move> PlayerMoved;

        public event EventHandler<Status> GameStutusChanged;

        public event EventHandler<NextMove> NextMove;

        public event EventHandler<ChatMessage> ChatMessageSent;

        public event EventHandler<PlayerLeaved> PlayerLeaved;

        public Game(IGameRulesChecker winnerChecker)
        {
            _winnerChecker = winnerChecker;
        }

        public IEnumerable<string> GetPlayersNames()
        {
            return _players.Select(player => player.Name);
        }

        public void AddPlayer(IPlayer player)
        {
            if (_players.Count >= 2)
            {
                return;
            }

            _players.Add(player);
            player.Game = this;
            player.Moved += OnPlayerMoved;
            player.ChatMessageSent += OnPlayerChatMessageSent;
            player.Disconnected += OnPlayerDisconnected;

            if (_players.Count == 2)
            {
                Start();
            }
            else
            {
                ChangeGameStatus(GameStatus.WaitingForSecondPlayer);
            }
        }

        private void RemovePlayer(IPlayer player)
        {
            player.Moved -= OnPlayerMoved;
            player.ChatMessageSent -= OnPlayerChatMessageSent;
            player.Disconnected -= OnPlayerDisconnected;
            _players.Remove(player);
        }

        private void OnPlayerDisconnected(object sender, EventArgs e)
        {
            var player = sender as IPlayer;
            PlayerLeaved?.Invoke(this, new PlayerLeaved { Name = player.Name });

            if (GameStatus == GameStatus.Started)
            {
                ChangeGameStatus(GameStatus.Aborted, new GameAborted { Reason = GameAbortedReson.PlayerDisconnected, Details = player.Name });
            }

            RemovePlayer(player);
        }

        private void OnPlayerChatMessageSent(object sender, string e)
        {
            IPlayer player = sender as IPlayer;
            if (player != null)
            {
                ChatMessageSent?.Invoke(this, new ChatMessage { SenderName = player.Name, Message = e });
            }
        }

        private void ChangeGameStatus(GameStatus status, object statusObject = null)
        {
            GameStatus = status;
            GameStutusChanged?.Invoke(this, new Status { GameStatus = status, StatusObject = statusObject });
        }

        private void Start()
        {
            var r = new Random();
            var firstPlayerMark = r.Next(0, 1) == 0 ? Mark.X : Mark.O;

            _players[0].Mark = firstPlayerMark;
            _players[1].Mark = firstPlayerMark == Mark.X ? Mark.O : Mark.X;

            _nextMove = Mark.Nothing;

            ChangeGameStatus(GameStatus.Started, _players.Select(player => new { player.Name, player.Mark }).ToArray());
            OnNextMove();
        }

        private void OnPlayerMoved(object sender, Move e)
        {
            var player = sender as Player;
            if (player == null)
            {
                //TODO: ?
            }

            var error = CanMove(player, e);
            if (error != null)
            {
                player.SendError(ErrorType.IncorrectMove, error);
                return;
            }

            _board[e.Cell] = _nextMove;

            PlayerMoved?.Invoke(this, e);

            CheckForEndOfGame(player);
        }

        private void CheckForEndOfGame(Player player)
        {
            var result = _winnerChecker.CheckGrid(_board, player.Mark);
            if (result.WinningCells != null || result.IsDraw)
            {
                ChangeGameStatus(GameStatus.Finnished, result);
            }
            else
            {
                OnNextMove();
            }
        }

        private void OnNextMove()
        {
            _nextMove = _nextMove == Mark.X ? Mark.O : Mark.X;
            NextMove?.Invoke(this, new NextMove { Mark = _nextMove });
        }

        private string CanMove(Player player, Move e)
        {
            if (GameStatus == GameStatus.WaitingForSecondPlayer)
            {
                return "Game did not started yet";
            }

            if (GameStatus == GameStatus.Finnished)
            {
                return "Cannot move: the game is already over";
            }

            if (_nextMove != player.Mark)
            {
                return "Another player's turn";
            }

            if (e.Cell < 0 || e.Cell > 8)
            {
                return "Move outside the grid";
            }

            if (_board[e.Cell] != Mark.Nothing)
            {
                return "Cell is already taken";
            }

            return null;
        }
    }
}