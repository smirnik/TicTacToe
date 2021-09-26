namespace TikTacToeGame
{
    public interface IGameFactory
    {
        IPlayer CreatePlayer(IPlayerConnection connection);

        IGame CreateGame();
    }
}