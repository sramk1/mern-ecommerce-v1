export default class ApiFeatures {
  constructor(query, queryStr) {
    this.query    = query;
    this.queryStr = queryStr;
  }

  search() {
    if (this.queryStr.keyword) {
      this.query = this.query.find({ name: { $regex: this.queryStr.keyword, $options: 'i' } });
    }
    return this;
  }

  filter() {
    const q = { ...this.queryStr };
    ['keyword', 'page', 'limit', 'sort'].forEach(f => delete q[f]);
    const str = JSON.stringify(q).replace(/\b(gt|gte|lt|lte)\b/g, m => `$${m}`);
    this.query = this.query.find(JSON.parse(str));
    return this;
  }

  sort() {
    this.query = this.queryStr.sort
      ? this.query.sort(this.queryStr.sort.split(',').join(' '))
      : this.query.sort('-createdAt');
    return this;
  }

  paginate(perPage) {
    const page = Number(this.queryStr.page) || 1;
    this.query  = this.query.skip(perPage * (page - 1)).limit(perPage);
    return this;
  }
}
