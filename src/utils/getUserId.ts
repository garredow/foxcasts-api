export function getUserId(request: any) {
  return (request.user as any).sub;
}
