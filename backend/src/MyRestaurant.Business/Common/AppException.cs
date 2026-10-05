namespace MyRestaurant.Business.Common;

public static class AppStatus
{
    public const int BadRequest = 400;
    public const int Unauthorized = 401;
    public const int NotFound = 404;
    public const int Conflict = 409;
}

public sealed class AppException : Exception
{
    public AppException(string message, int statusCode = AppStatus.BadRequest)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public int StatusCode { get; }
}
