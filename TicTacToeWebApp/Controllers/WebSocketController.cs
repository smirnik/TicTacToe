using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using TicTacToeWebApp.Game.WebSocketPlayerConnection;
using TikTacToeGame;

namespace TicTacToeWebApp.Controllers
{
    public class WebSocketController : ControllerBase
    {
        private readonly IGameManager _gameManager;
        private readonly IMessageSerializer _messageSerializer;
        private readonly ILogger<WebSocketConnection> _logger;

        public WebSocketController(IGameManager gameManager, IMessageSerializer messageSerializer, ILogger<WebSocketConnection> logger)
        {
            _gameManager = gameManager;
            _messageSerializer = messageSerializer;
            _logger = logger;
        }

        [HttpGet("/ws")]
        public async Task Get()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                WebSocketConnection clientConnection = new(webSocket, _logger, _messageSerializer);
                _gameManager.AddPlayerToGame(clientConnection);
                await clientConnection.ReceiveMessageAsync();
            }
            else
            {
                HttpContext.Response.StatusCode = 400;
            }
        }
    }
}
