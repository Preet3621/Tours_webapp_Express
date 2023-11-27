class APIFeatures {
    constructor(query,queryString) {
        this.query = query;
        this.queryString = queryString
    }

    filter() {
        const queryObject = {...this.queryString};
        const excludeFields = ['page','sort','limit','fields'];
        excludeFields.forEach(el => delete queryObject[el]);

        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        //let query = Tour.find(JSON.parse(queryStr));
        return this
    }

    sort() {
        if (this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            console.log(sortBy)
            this.query = this.query.sort(sortBy)
        }
        return this
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        }
        else{
            this.query = this.query.select('-__v')
        }
        return this
    }

    paginate() {
        const page = (this.queryString.page) * 1 || 1;
        const limit = (this.queryString.limit) * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit)
        return this
    }
}

module.exports = APIFeatures