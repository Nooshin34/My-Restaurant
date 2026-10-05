namespace MyRestaurant.Api.Common;

public sealed class AppException : Exception
{
    public AppException(string message, int statusCode = StatusCodes.Status400BadRequest)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public int StatusCode { get; }
}
