using Microsoft.Extensions.Logging;
using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using TikTacToeGame;
using TikTacToeGame.Events;

namespace TicTacToeWebApp.Game.WebSocketPlayerConnection
{
    public class WebSocketConnection : IPlayerConnection
    {
        private readonly WebSocket _webSocket;
        private ILogger<WebSocketConnection> _logger;
        private readonly IMessageSerializer _serializer;

        public event EventHandler<object> MessageReceived;
        public event EventHandler Disconnected;

        public WebSocketConnection(WebSocket webSocket, ILogger<WebSocketConnection> logger, IMessageSerializer serializer)
        {
            _webSocket = webSocket;
            _logger = logger;
            _serializer = serializer;
        }

        private void OnMessageReceived(object eventOjbect)
        {
            MessageReceived?.Invoke(this, eventOjbect);
        }

        public async Task ReceiveMessageAsync()
        {
            var buffer = new byte[1024 * 4];
            while (_webSocket.State == WebSocketState.Open)
            {
                int offset = 0;
                WebSocketReceiveResult receiveResult;
                do
                {
                    //TODO: try...catch
                    receiveResult = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer, offset, buffer.Length - offset), CancellationToken.None);
                    offset += receiveResult.Count;
                }
                while (!receiveResult.EndOfMessage);

                try
                {
                    await HangleReceivedMessage(buffer, offset, receiveResult);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Message handling error");
                }
            }

            if (_webSocket.State == WebSocketState.Closed || _webSocket.State == WebSocketState.Aborted)
            {
                OnClosed();
            }

        }

        private void OnClosed()
        {
            Disconnected?.Invoke(this, EventArgs.Empty);
        }

        private async Task HangleReceivedMessage(byte[] buffer, int length, WebSocketReceiveResult receiveResult)
        {
            switch (receiveResult.MessageType)
            {
                case WebSocketMessageType.Text:
                    var eventObject = GetEventObject(Encoding.UTF8.GetString(buffer, 0, length));
                    OnMessageReceived(eventObject);
                    break;
                case WebSocketMessageType.Close:
                    await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                    break;
                default:
                    throw new NotSupportedException($"{receiveResult.MessageType} message type is not supported");
            }
        }

        private object GetEventObject(string message)
        {
            return _serializer.Deserialize(message);
        }

        public void SendEvent(EventType eventType, object eventObject)
        {
            var message = Encoding.UTF8.GetBytes(_serializer.Serialize(eventType, eventObject));
            _webSocket.SendAsync(message, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
}
