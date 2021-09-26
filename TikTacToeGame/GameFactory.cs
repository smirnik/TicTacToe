using System;

namespace TikTacToeGame
{
    public class GameFactory : IGameFactory
    {
        public IPlayer CreatePlayer(IPlayerConnection connection)
        {
            return new Player(connection);
        }

        public IGame CreateGame()
        {
            return new Game(WinnerChecker);
        }

        private readonly Lazy<GameRulesChecker> _winnerChecker = new();

        private GameRulesChecker WinnerChecker { get => _winnerChecker.Value; }
    }
}