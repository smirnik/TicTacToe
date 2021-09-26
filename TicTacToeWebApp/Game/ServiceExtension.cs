using Microsoft.Extensions.DependencyInjection;
using TicTacToeWebApp.Game.WebSocketPlayerConnection;
using TikTacToeGame;

namespace TicTacToeWebApp.Game
{
    public static class ServiceExtension
    {
        public static void AddTikTakTok(this IServiceCollection services)
        {
            services.AddSingleton<IMessageSerializer, MessageSerializer>();
            services.AddSingleton<IGameFactory, GameFactory>();
            services.AddSingleton<IGameManager, GameManager>();
        }
    }
}
