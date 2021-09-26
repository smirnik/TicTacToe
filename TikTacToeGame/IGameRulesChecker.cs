namespace TikTacToeGame
{
    public interface IGameRulesChecker
    {
        GameResult CheckGrid(Mark[] grid, Mark mark);
    }
}