namespace API.Utils
{
    public static class CsvHelper
    {
        /// <summary>
        /// Devuelve un archivo CSV (UTF-8 con BOM) a partir de una cadena.
        /// </summary>
        public static IResult FileCsv(string fileName, string csvData)
        {
            var preamble = System.Text.Encoding.UTF8.GetPreamble();
            var bytes = preamble.Concat(System.Text.Encoding.UTF8.GetBytes(csvData)).ToArray();
            return Results.File(bytes, "text/csv; charset=utf-8", fileName);
        }
    }
}
