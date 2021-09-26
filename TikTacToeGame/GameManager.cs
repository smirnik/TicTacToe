using System;
using TikTacToeGame.Events;

namespace TikTacToeGame
{
    public class GameManager : IGameManager
    {
        private readonly object lockObject = new();
        private readonly IGameFactory _gameFactory;
        private IGame _waitingGame;

        public GameManager(IGameFactory gameFactory)
        {
            _gameFactory = gameFactory;
        }

        public void AddPlayerToGame(IPlayerConnection connection)
        {
            var player = _gameFactory.CreatePlayer(connection);
            player.OnReady += PlayerReady;
            player.Disconnected += PlayerDisconnected;
        }

        private void PlayerReady(object sender, PlayerReady e)
        {
            var player = sender as IPlayer;

            if (!ValidatePlayer(player, e))
            {
                return;
            }

            lock (lockObject)
            {
                if (_waitingGame == null)
                {
                    _waitingGame = _gameFactory.CreateGame();
                }

                _waitingGame.AddPlayer(player);

                if (_waitingGame.GameStatus == GameStatus.Started)
                {
                    _waitingGame = null;
                }
            }
        }

        private void PlayerDisconnected(object sender, EventArgs e)
        {
            var player = sender as IPlayer;

            player.Disconnected -= PlayerDisconnected;
            player.OnReady -= PlayerReady;
        }

        private bool ValidatePlayer(IPlayer player, PlayerReady e)
        {
            if (string.IsNullOrWhiteSpace(e.PlayerName))
            {
                player.SendError(ErrorType.InvalidPlayerData, "Name cannot be empty");
                return false;
            }

            return true;
        }
    }
}